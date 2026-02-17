<?php
session_start();
require_once __DIR__ . '/api/config.php';

// Simple admin authentication (session)
$loggedIn = !empty($_SESSION['admin']);

// Handle login POST
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

// Handle logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// DB connection
$dbFile = __DIR__ . '/data/pins.sqlite';
$rows = [];
if ($loggedIn) {
    if (!file_exists($dbFile)) {
        $rows = [];
    } else {
        $pdo = new PDO('sqlite:' . $dbFile);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // CSV download
        if (isset($_GET['action']) && $_GET['action'] === 'download') {
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="pins_export.csv"');
            // UTF-8 BOM for Excel on Windows
            echo "\xEF\xBB\xBF";
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'pin', 'success', 'created_at']);
            $stmt = $pdo->query('SELECT id, pin, success, created_at FROM pins ORDER BY id DESC');
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                fputcsv($out, [$r['id'], $r['pin'], $r['success'], $r['created_at']]);
            }
            fclose($out);
            exit;
        }

        $stmt = $pdo->query('SELECT id, pin, success, created_at FROM pins ORDER BY id DESC LIMIT 1000');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Admin — Pin submissions</title>
    <style>
        body{font-family:Inter,system-ui,Segoe UI,Arial;margin:24px;background:#fff}
        .card{max-width:980px;margin:0 auto;padding:20px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.06)}
        table{width:100%;border-collapse:collapse;font-size:14px}
        th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
        th{background:#fafafa}
        .success-1{color:green;font-weight:600}
        .success-0{color:#c0392b;font-weight:600}
        .controls{display:flex;gap:8px;align-items:center;margin-bottom:12px}
        .btn{padding:8px 12px;border-radius:6px;background:#ff6b81;color:#fff;text-decoration:none;display:inline-block}
        .btn--muted{background:#666}
        .mask-toggle{margin-left:auto}
        .note{color:#666;font-size:13px}
        .error{color:#c0392b}
        input[type=password]{padding:8px;border-radius:6px;border:1px solid #ddd}
    </style>
</head>
<body>
<div class="card">
<?php if (!$loggedIn): ?>
    <h2>เข้าสู่ระบบแอดมิน</h2>
    <p class="note">ป้อนรหัสแอดมินเพื่อดูรายการการใส่รหัส (PIN)</p>
    <?php if (!empty($error)): ?><div class="error"><?=htmlspecialchars($error)?></div><?php endif; ?>
    <form method="post" style="margin-top:12px">
        <input name="admin_password" type="password" placeholder="รหัสแอดมิน" required>
        <button class="btn" type="submit">เข้าสู่ระบบ</button>
    </form>
    <hr>
    <p class="note">หมายเหตุ: รหัสเริ่มต้นสามารถเปลี่ยนได้ที่ <code>api/config.php</code></p>
<?php else: ?>
    <div style="display:flex;align-items:center;gap:12px;">
        <h2 style="margin:0">รายการการใส่รหัส</h2>
        <div class="mask-toggle">
            <label><input id="maskPins" type="checkbox" checked> ซ่อน PIN</label>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px">
            <a class="btn" href="admin.php?action=download">ดาวน์โหลด CSV</a>
            <a class="btn btn--muted" href="admin.php?action=logout">ออกจากระบบ</a>
        </div>
    </div>

    <p class="note">แสดงล่าสุด <?=count($rows)?> รายการ (สูงสุด 1000)</p>

    <table>
        <thead>
            <tr><th>ID</th><th>PIN</th><th>ผลลัพธ์</th><th>เวลา</th></tr>
        </thead>
        <tbody>
            <?php foreach ($rows as $r): ?>
                <tr>
                    <td><?=htmlspecialchars($r['id'])?></td>
                    <td class="pin-cell" data-pin="<?=htmlspecialchars($r['pin'])?>">••••••</td>
                    <td class="<?= $r['success'] ? 'success-1' : 'success-0' ?>"><?= $r['success'] ? 'สำเร็จ' : 'ล้มเหลว' ?></td>
                    <td><?=htmlspecialchars($r['created_at'])?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>
</div>
<script>
    document.addEventListener('DOMContentLoaded', function(){
        const toggle = document.getElementById('maskPins');
        if (!toggle) return;
        toggle.addEventListener('change', function(){
            document.querySelectorAll('.pin-cell').forEach(td => {
                const pin = td.dataset.pin || '';
                td.textContent = toggle.checked ? '••••••' : pin;
            });
        });
    });
</script>
</body>
</html>