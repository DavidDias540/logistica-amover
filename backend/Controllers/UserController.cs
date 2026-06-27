using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using projeto.Data.Models;
using projeto.Services;
using System.Security.Claims;
using Task = projeto.Data.Models.Task;

namespace projeto.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserServices _db;
        private readonly UserTaskServices _taskdb;
        private readonly ILogger<UserController> _logger;
        private readonly KeycloakAdminService _keycloakService;
        private readonly IEmailService _emailService;

        public UserController(ILogger<UserController> logger, UserServices db, UserTaskServices taskdb, KeycloakAdminService keycloakService, IEmailService emailService)
        {
            _logger = logger;
            _db = db;
            _taskdb = taskdb;
            _keycloakService = keycloakService;
            _emailService = emailService;
        }

        // Devolve o utilizador autenticado a partir do email no token JWT.
        // Se ainda não existir na base de dados, cria-o automaticamente (útil para o primeiro admin).
        private User? GetCurrentUser()
        {
            // O Keycloak/JwtSecurityTokenHandler mapeia "email" para o claim com namespace.
            var email = User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value
                ?? User.FindFirst("preferred_username")?.Value
                ?? User?.Identity?.Name;
            _logger.LogInformation($"GetCurrentUser: resolvedEmail={email}");
            if (string.IsNullOrEmpty(email)) return null;

            var user = _db.GetUserByEmail(email);
            _logger.LogInformation($"GetCurrentUser: user found = {user != null}");
            if (user != null) return user;

            // Utilizador autenticado no Keycloak mas não existe na BD: criar registo mínimo.
            var name = User.FindFirst("name")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst("preferred_username")?.Value
                ?? email;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? "user";
            // Se tiver múltiplas roles, preferir admin > manager > motorista > user
            var roles = User.FindAll(ClaimTypes.Role)
                .Concat(User.FindAll("role"))
                .Select(c => c.Value.ToLower())
                .ToList();
            var role = roles.Contains("admin") ? "admin"
                : roles.Contains("manager") ? "manager"
                : roles.Contains("motorista") ? "motorista"
                : roleClaim;

            var newUser = new User
            {
                name = name,
                email = email,
                password = "[MANAGED_BY_KEYCLOAK]",
                role = role,
                is_active = true
            };
            _db.CreateUser(newUser, null);
            return _db.GetUserByEmail(email);
        }

        private bool IsAdmin(User u) => u.role?.ToLower() == "admin";
        private bool IsManager(User u) => u.role?.ToLower() == "manager";
        private bool IsAdminOrManager(User u) => IsAdmin(u) || IsManager(u);

        // Helper to generate a random password (9 chars, with upper, lower, numbers, symbols)
        private string GenerateRandomPassword()
        {
            // Evita caracteres que causam problemas em URLs/formulários (ex: ^, &, *, <, >, @, =, $, +, espaços)
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!-?";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 9).Select(s => s[random.Next(s.Length)]).ToArray()) + "A1!"; // ensure at least one upper, digit, symbol if needed
        }

        // --- CRUD DE UTILIZADOR ---

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserDTO user)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado na base de dados.");

                // Generate password if not provided
                var generatedPassword = string.IsNullOrEmpty(user.Password) ? GenerateRandomPassword() : user.Password;
                var role = user.Role ?? "user";
                if (role.ToLower() == "driver") role = "motorista";

                // Apenas admin pode criar managers
                if (role.ToLower() == "manager" && !IsAdmin(currentUser))
                {
                    return Forbid("Apenas administradores podem criar gestores.");
                }

                // Apenas admin ou manager podem criar drivers/motoristas
                if (role.ToLower() == "motorista" && !IsAdminOrManager(currentUser))
                {
                    return Forbid("Apenas administradores ou gestores podem criar condutores.");
                }

                // Manager só pode criar na sua própria empresa
                int? effectiveCompanyId = user.CompanyID;
                if (IsManager(currentUser))
                {
                    effectiveCompanyId = currentUser.companyID;
                }

                // Criar no Keycloak para roles que precisam de login (motorista, manager)
                if (role.ToLower() == "motorista" || role.ToLower() == "manager")
                {
                    try 
                    {
                        // Motorista: password não marcada como temporária no Keycloak para permitir login na app móvel
                        // A app usa a flag RequiresPasswordChange do backend para forçar a alteração
                        bool temporary = role.ToLower() == "manager";
                        await _keycloakService.CreateRealmUserAsync(user.Email, user.Name, generatedPassword, role.ToLower(), temporary);
                        _logger.LogInformation($"[SIMULAÇÃO DE EMAIL] Utilizador criado! Email: {user.Email} | Role: {role} | Password Temporária: {generatedPassword}");
                    }
                    catch (Exception kex)
                    {
                        _logger.LogError(kex, "Aviso: Falha ao criar utilizador no Keycloak, continuando na base de dados...");
                        return StatusCode(500, "Erro ao criar utilizador no Keycloak: " + kex.Message);
                    }
                }

                User u = new User
                {
                    name = user.Name,
                    email = user.Email,
                    password = "[MANAGED_BY_KEYCLOAK]", // A password real fica exclusivamente no Keycloak
                    role = role,
                    driverLicense = user.DriverLicense,
                    citizenCard = user.CitizenCard,
                    phone = user.Phone,
                    address = user.Address,
                    photoUrl = user.PhotoUrl,
                    RequiresPasswordChange = (role.ToLower() == "motorista") // Exige mudança se for motorista
                };

                // Passa o CompanyID para o serviço conforme a alteração no UserServices
                _db.CreateUser(u, effectiveCompanyId);

                // Send email to user with the credentials
                var emailSubject = "Amover - Bem-vindo! Detalhes da sua conta";
                var emailBody = $"Olá {user.Name},\n\nA sua conta foi criada com sucesso.\nEmail: {user.Email}\nPassword temporária: {generatedPassword}\n\nPor favor, inicie sessão na aplicação e altere a sua password.";
                await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);

                // Return user and temporary password to UI so admin can share it
                return Ok(new { User = u, TemporaryPassword = generatedPassword });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar utilizador.");
                return StatusCode(500, "Erro interno: " + ex.Message);
            }
        }

        [HttpGet]
        public ActionResult<IEnumerable<User>> Get()
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                List<User> targets = _db.GetUsers();
                if (IsManager(currentUser))
                {
                    targets = targets.Where(u => u.companyID == currentUser.companyID).ToList();
                }

                if (targets == null || targets.Count == 0)
                {
                    return NotFound("Nenhum utilizador encontrado.");
                }
                return Ok(targets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter utilizadores.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpGet("{userID}")]
        public ActionResult<User> Get(int userID)
        {
            try
            {
                var target = _db.GetUserByID(userID);
                return target == null ? NotFound("Utilizador não encontrado") : Ok(target);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter utilizador.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpGet("byEmail/{email}")]
        public ActionResult<User> GetByEmail(string email)
        {
            try
            {
                var target = _db.GetUserByEmail(email);
                return target == null ? NotFound("Utilizador não encontrado") : Ok(target);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter utilizador por email.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpGet("me")]
        public ActionResult<User> GetMe()
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");
                return Ok(currentUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter utilizador autenticado.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpPut("{userID}")]
        public IActionResult Put(int userID, [FromBody] UserDTO user)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var existingUser = _db.GetUserByID(userID);
                if (existingUser == null) return NotFound("Utilizador não encontrado.");

                if (IsManager(currentUser) && existingUser.companyID != currentUser.companyID)
                {
                    return Forbid("Não pode editar utilizadores de outra empresa.");
                }

                // Manager não pode promover ninguém a admin ou manager
                var newRole = (user.Role != null && user.Role.ToLower() == "driver") ? "motorista" : (user.Role ?? existingUser.role);
                if (IsManager(currentUser) && (newRole.ToLower() == "admin" || newRole.ToLower() == "manager"))
                {
                    return Forbid("Gestor não pode atribuir papéis de administrador ou gestor.");
                }

                User u = new User
                {
                    ID = userID,
                    name = !string.IsNullOrEmpty(user.Name) ? user.Name : existingUser.name,
                    email = !string.IsNullOrEmpty(user.Email) ? user.Email : existingUser.email,
                    password = "[MANAGED_BY_KEYCLOAK]", // A password real fica no Keycloak
                    role = newRole,
                    driverLicense = user.DriverLicense ?? existingUser.driverLicense,
                    citizenCard = user.CitizenCard ?? existingUser.citizenCard,
                    phone = user.Phone ?? existingUser.phone,
                    address = user.Address ?? existingUser.address,
                    photoUrl = user.PhotoUrl ?? existingUser.photoUrl,
                    is_active = user.Status != null ? (user.Status == "active") : user.IsActive,
                    companyID = IsManager(currentUser) ? existingUser.companyID : (user.CompanyID ?? existingUser.companyID)
                };
                return _db.EditUser(u) ? Ok(new { message = "Utilizador atualizado com sucesso." }) : NotFound("Utilizador não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar utilizador.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpDelete("{userID}")]
        public async Task<IActionResult> Delete(int userID)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var user = _db.GetUserByID(userID);
                if (user == null) return NotFound("Utilizador não encontrado.");

                if (IsManager(currentUser) && user.companyID != currentUser.companyID)
                {
                    return Forbid("Não pode eliminar utilizadores de outra empresa.");
                }

                if (IsManager(currentUser) && user.role?.ToLower() == "admin")
                {
                    return Forbid("Não pode eliminar administradores.");
                }

                // If user is a driver (motorista) or manager, delete from Keycloak too
                if (user.role != null && (user.role.ToLower() == "motorista" || user.role.ToLower() == "manager"))
                {
                    try 
                    {
                        await _keycloakService.DeleteUserByEmailAsync(user.email);
                    }
                    catch (Exception kex)
                    {
                        _logger.LogError(kex, "Aviso: Falha ao eliminar utilizador no Keycloak.");
                    }
                }

                return _db.DeleteUser(userID) ? Ok(new { message = "Utilizador eliminado com sucesso." }) : NotFound("Utilizador não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao eliminar utilizador.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO data)
        {
            try
            {
                var user = _db.GetUserByEmail(data.Email);
                if (user == null) return NotFound("Utilizador não encontrado.");

                // Mudar no Keycloak
                try 
                {
                    await _keycloakService.UpdateUserPasswordAsync(data.Email, data.NewPassword);
                }
                catch (Exception kex)
                {
                    _logger.LogError(kex, "Erro ao alterar password no Keycloak");
                    return StatusCode(500, "Erro ao atualizar no serviço de autenticação.");
                }

                // Atualizar BD (apenas metadados, a password já não é guardada aqui)
                user.password = "[MANAGED_BY_KEYCLOAK]";
                user.RequiresPasswordChange = false;
                _db.EditUser(user);

                return Ok(new { message = "Password alterada com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao mudar password.");
                return StatusCode(500, "Erro interno.");
            }
        }

        // --- ASSOCIAÇÃO DE TAREFAS (Igual à lógica de Nodes no URL) ---

        [HttpPost("{userID}/task/{taskID}")]
        public IActionResult PostTask(int userID, int taskID)
        {
            try
            {
                // Agora os IDs vêm diretamente do URL, sem necessidade de JSON body
                _taskdb.AddTaskToUser(userID, taskID);
                return Ok(new { message = "Tarefa associada com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar tarefa.");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{userID}/tasks")]
        public ActionResult<List<Task>> GetTasks(int userID)
        {
            try
            {
                var target = _taskdb.GetTasksByUser(userID);
                return target == null ? NotFound("O utilizador não possui tarefas") : Ok(target);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter tarefas.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpDelete("{userID}/task/{taskID}")]
        public IActionResult DeleteTask(int userID, int taskID)
        {
            try
            {
                _taskdb.RemoveTaskFromUser(userID, taskID);
                return Ok(new { message = "Tarefa removida com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao eliminar tarefa.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpPut("{userID}/reset-password")]
        public async Task<IActionResult> ResetPassword(int userID)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");
                if (!IsAdmin(currentUser) && !IsManager(currentUser)) return Forbid("Sem permissão.");

                var target = _db.GetUserByID(userID);
                if (target == null) return NotFound("Utilizador não encontrado.");

                if (IsManager(currentUser) && target.companyID != currentUser.companyID)
                    return Forbid("Não pode resetar password de utilizadores de outra empresa.");

                var newPassword = GenerateRandomPassword();
                await _keycloakService.SetTemporaryPasswordAsync(target.email, newPassword);

                target.RequiresPasswordChange = true;
                _db.EditUser(target);

                return Ok(new { TemporaryPassword = newPassword });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao resetar password do utilizador {userID}", userID);
                return StatusCode(500, "Erro interno: " + ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO request)
        {
            try
            {
                var target = _db.GetUserByEmail(request.Email);
                if (target == null) return Ok(new { message = "Se o email existir, receberá as instruções." });

                var newPassword = GenerateRandomPassword();
                await _keycloakService.SetTemporaryPasswordAsync(target.email, newPassword);

                target.RequiresPasswordChange = true;
                _db.EditUser(target);

                var emailSubject = "Amover - Recuperação de Password";
                var emailBody = $"Olá {target.name},\n\nFoi pedido um reset de password para a sua conta.\nEmail: {target.email}\nPassword temporária: {newPassword}\n\nPor favor, inicie sessão na aplicação móvel e altere a sua password.";
                await _emailService.SendEmailAsync(target.email, emailSubject, emailBody);

                return Ok(new { message = "Se o email existir, receberá as instruções." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar forgot-password para {Email}", request.Email);
                return StatusCode(500, "Erro interno.");
            }
        }

        // --- DTOs ---

        public class ForgotPasswordDTO
        {
            public string Email { get; set; } = "";
        }

        public class UserDTO
        {
            public string Name { get; set; } = "";
            public string Email { get; set; } = "";
            public string Password { get; set; } = "";
            public string? Role { get; set; }
            public int? CompanyID { get; set; }
            public string? DriverLicense { get; set; }
            public string? CitizenCard { get; set; }
            public string? Phone { get; set; }
            public string? Address { get; set; }
            public string? PhotoUrl { get; set; }
            public bool IsActive { get; set; } = true;
            public string? Status { get; set; } // "active" or "inactive"
        }

        public class ChangePasswordDTO
        {
            public string Email { get; set; } = "";
            public string NewPassword { get; set; } = "";
        }
    }
}