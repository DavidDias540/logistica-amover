using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace projeto.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.sendgrid.net";
            var smtpPort = int.TryParse(_configuration["Email:SmtpPort"], out var port) ? port : 587;
            var smtpUser = _configuration["Email:SmtpUser"] ?? "apikey";
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var fromEmail = _configuration["Email:FromEmail"] ?? "no-reply@amover.pt";
            var fromName = _configuration["Email:FromName"] ?? "AMoVeR";

            if (string.IsNullOrEmpty(smtpPassword))
            {
                _logger.LogWarning("Email:SmtpPassword não configurado. Email não enviado.");
                return;
            }

            try
            {
                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUser, smtpPassword),
                    DeliveryFormat = SmtpDeliveryFormat.International,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Timeout = 30000
                };

                var message = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = false
                };
                message.To.Add(toEmail);

                await client.SendMailAsync(message);
                _logger.LogInformation("Email enviado para {To} com assunto {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email para {To}", toEmail);
                // Não atirar excepção para não rebentar a API quando as credenciais de email (SendGrid) não estão configuradas
            }
        }
    }
}
