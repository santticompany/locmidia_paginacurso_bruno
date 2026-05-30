<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido."]);
    exit;
}

// Get JSON raw payload
$inputRaw = file_get_contents("php://input");
$input = json_decode($inputRaw, true);

if (!$input) {
    // Fallback to standard POST form data if needed
    $input = $_POST;
}

// Extract and sanitize variables
$nome = isset($input["nome"]) ? strip_tags(trim($input["nome"])) : "";
$email = isset($input["email"]) ? filter_var(trim($input["email"]), FILTER_SANITIZE_EMAIL) : "";
$telefone = isset($input["telefone"]) ? strip_tags(trim($input["telefone"])) : "";
$empresa = isset($input["empresa"]) ? strip_tags(trim($input["empresa"])) : "";
$segmento = isset($input["segmento"]) ? strip_tags(trim($input["segmento"])) : "";
$faturamento = isset($input["faturamento"]) ? strip_tags(trim($input["faturamento"])) : "";

// Validate required fields
if (empty($nome) || empty($email) || empty($telefone)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Por favor, preencha nome, e-mail e telefone."]);
    exit;
}

// Recipients
$to = "atendimento@locmidia.digital, bcrepresentante@gmail.com, danielporto.locmidia@gmail.com";

// Subject
$subject = "Novo Lead VDR - " . $nome;

// HTML Message Body with premium blue and gold formatting
$message = "
<html>
<head>
    <title>Novo Lead Cadastrado - Sistema VDR</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #07122A; color: #FFFFFF; padding: 20px; }
        .card { background-color: #0F1E3D; border: 2px solid #C9A84C; border-radius: 16px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .header { text-align: center; border-bottom: 1px solid rgba(201, 168, 76, 0.3); padding-bottom: 20px; margin-bottom: 20px; }
        .logo-title { color: #C9A84C; font-size: 24px; font-weight: bold; margin: 0; }
        .subtitle { color: #C5D0E0; font-size: 14px; margin-top: 5px; }
        .item { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; }
        .label { font-weight: bold; color: #C9A84C; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        .val { color: #FFFFFF; font-size: 16px; }
        .footer { text-align: center; font-size: 11px; color: #C5D0E0; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <div class='logo-title'>SISTEMA VDR™</div>
            <div class='subtitle'>Novo Lead Recebido pelo Website</div>
        </div>
        
        <div class='item'>
            <span class='label'>Nome Completo:</span>
            <span class='val'>$nome</span>
        </div>
        
        <div class='item'>
            <span class='label'>E-mail:</span>
            <span class='val'>$email</span>
        </div>
        
        <div class='item'>
            <span class='label'>Telefone / WhatsApp:</span>
            <span class='val'>$telefone</span>
        </div>
        
        <div class='item'>
            <span class='label'>Nome da Empresa:</span>
            <span class='val'>" . (empty($empresa) ? "Não Informado" : $empresa) . "</span>
        </div>
        
        <div class='item'>
            <span class='label'>Segmento do Restaurante:</span>
            <span class='val'>$segmento</span>
        </div>
        
        <div class='item'>
            <span class='label'>Faturamento Mensal:</span>
            <span class='val'>$faturamento</span>
        </div>
        
        <div class='footer'>
            Este e-mail foi enviado automaticamente pelo formulário de captura do Sistema VDR.
        </div>
    </div>
</body>
</html>
";

// Headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'locmidia.digital';
$headers .= "From: Lead Sistema VDR <no-reply@" . $host . ">" . "\r\n";
$headers .= "Reply-To: $email" . "\r\n";

// Send email
$mailSent = mail($to, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode(["status" => "success", "message" => "Lead cadastrado com sucesso."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erro ao enviar e-mail no servidor."]);
}
?>
