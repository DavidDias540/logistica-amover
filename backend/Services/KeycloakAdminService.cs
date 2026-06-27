using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;

namespace projeto.Services
{
    public class KeycloakAdminService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<KeycloakAdminService> _logger;

        public KeycloakAdminService(HttpClient httpClient, IConfiguration config, ILogger<KeycloakAdminService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
        }

        private async Task<string> GetAdminTokenAsync()
        {
            // O host 'keycloak' funciona no docker. Localmente pode falhar se não tiver mapeado.
            // Para simplificar, vamos assumir que o backend corre no docker ou o docker expõe a 8080 localmente.
            var keycloakUrl = "http://keycloak:8080"; 
            
            var request = new HttpRequestMessage(HttpMethod.Post, $"{keycloakUrl}/realms/master/protocol/openid-connect/token");
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "client_id", "admin-cli" },
                { "username", "admin" },
                { "password", "admin" },
                { "grant_type", "password" }
            });

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to get Keycloak Admin token: {err}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonConvert.DeserializeObject<dynamic>(content);
            return json.access_token;
        }

        public async Task CreateDriverUserAsync(string email, string name, string temporaryPassword)
        {
            await CreateRealmUserAsync(email, name, temporaryPassword, "motorista", temporary: false);
        }

        public async Task CreateRealmUserAsync(string email, string name, string temporaryPassword, string roleName, bool temporary = true)
        {
            var token = await GetAdminTokenAsync();
            var keycloakUrl = "http://keycloak:8080";
            var realm = "amover-realm";

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // 1. Criar Utilizador
            var nameParts = name.Trim().Split(' ', 2);
            var firstName = nameParts[0];
            var lastName = nameParts.Length > 1 ? nameParts[1] : firstName; // Keycloak requires lastName

            var userPayload = new
            {
                username = email,
                email = email,
                firstName = firstName,
                lastName = lastName,
                enabled = true,
                emailVerified = true
            };

            var userContent = new StringContent(JsonConvert.SerializeObject(userPayload), Encoding.UTF8, "application/json");
            var createResponse = await _httpClient.PostAsync($"{keycloakUrl}/admin/realms/{realm}/users", userContent);

            if (!createResponse.IsSuccessStatusCode && createResponse.StatusCode != System.Net.HttpStatusCode.Conflict)
            {
                var err = await createResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to create user in Keycloak: {err}");
            }

            // 2. Obter o ID do Utilizador recém-criado
            var getUsersResponse = await _httpClient.GetAsync($"{keycloakUrl}/admin/realms/{realm}/users?username={email}&exact=true");
            var usersJson = await getUsersResponse.Content.ReadAsStringAsync();
            var users = JsonConvert.DeserializeObject<dynamic[]>(usersJson);
            if (users == null || users.Length == 0) throw new Exception("User not found after creation");
            
            string userId = users[0].id;

            // 2.1. Definir a Password do Utilizador
            var passwordPayload = new
            {
                type = "password",
                value = temporaryPassword,
                temporary = temporary
            };
            var passwordContent = new StringContent(JsonConvert.SerializeObject(passwordPayload), Encoding.UTF8, "application/json");
            var passwordResponse = await _httpClient.PutAsync($"{keycloakUrl}/admin/realms/{realm}/users/{userId}/reset-password", passwordContent);

            if (!passwordResponse.IsSuccessStatusCode)
            {
                var err = await passwordResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to set password in Keycloak: {err}");
            }

            // 3. Obter o ID da Role
            var getRoleResponse = await _httpClient.GetAsync($"{keycloakUrl}/admin/realms/{realm}/roles/{roleName}");
            if (getRoleResponse.IsSuccessStatusCode)
            {
                var roleJson = await getRoleResponse.Content.ReadAsStringAsync();
                var role = JsonConvert.DeserializeObject<dynamic>(roleJson);
                string roleId = role.id;

                // 4. Atribuir a role ao utilizador
                var rolePayload = new[]
                {
                    new
                    {
                        id = roleId,
                        name = roleName
                    }
                };

                var roleContent = new StringContent(JsonConvert.SerializeObject(rolePayload), Encoding.UTF8, "application/json");
                var assignRoleResponse = await _httpClient.PostAsync($"{keycloakUrl}/admin/realms/{realm}/users/{userId}/role-mappings/realm", roleContent);
                
                if (!assignRoleResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Failed to assign '{roleName}' role to {email}");
                }
            }
            else
            {
                _logger.LogWarning($"Role '{roleName}' not found in Keycloak realm.");
            }
        }

        public async Task DeleteUserByEmailAsync(string email)
        {
            var token = await GetAdminTokenAsync();
            var keycloakUrl = "http://keycloak:8080";
            var realm = "amover-realm";

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Obter o ID do Utilizador a apagar
            var getUsersResponse = await _httpClient.GetAsync($"{keycloakUrl}/admin/realms/{realm}/users?username={email}&exact=true");
            var usersJson = await getUsersResponse.Content.ReadAsStringAsync();
            var users = JsonConvert.DeserializeObject<dynamic[]>(usersJson);
            
            if (users == null || users.Length == 0) 
            {
                _logger.LogWarning($"User with email {email} not found in Keycloak for deletion.");
                return;
            }
            
            string userId = users[0].id;

            // Apagar o utilizador
            var deleteResponse = await _httpClient.DeleteAsync($"{keycloakUrl}/admin/realms/{realm}/users/{userId}");
            
            if (!deleteResponse.IsSuccessStatusCode)
            {
                var err = await deleteResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to delete user in Keycloak: {err}");
            }
            else
            {
                _logger.LogInformation($"Deleted user {email} from Keycloak.");
            }
        }
        public async Task UpdateUserPasswordAsync(string email, string newPassword)
        {
            var token = await GetAdminTokenAsync();
            var keycloakUrl = "http://keycloak:8080";
            var realm = "amover-realm";

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Obter o ID do Utilizador
            var getUsersResponse = await _httpClient.GetAsync($"{keycloakUrl}/admin/realms/{realm}/users?username={email}&exact=true");
            var usersJson = await getUsersResponse.Content.ReadAsStringAsync();
            var users = JsonConvert.DeserializeObject<dynamic[]>(usersJson);
            
            if (users == null || users.Length == 0) 
            {
                throw new Exception($"User with email {email} not found in Keycloak.");
            }
            
            string userId = users[0].id;

            // Definir a Nova Password do Utilizador
            var passwordPayload = new
            {
                type = "password",
                value = newPassword,
                temporary = false
            };
            var passwordContent = new StringContent(JsonConvert.SerializeObject(passwordPayload), Encoding.UTF8, "application/json");
            var passwordResponse = await _httpClient.PutAsync($"{keycloakUrl}/admin/realms/{realm}/users/{userId}/reset-password", passwordContent);

            if (!passwordResponse.IsSuccessStatusCode)
            {
                var err = await passwordResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to update password in Keycloak: {err}");
            }
        }

        public async Task SetTemporaryPasswordAsync(string email, string newPassword)
        {
            var token = await GetAdminTokenAsync();
            var keycloakUrl = "http://keycloak:8080";
            var realm = "amover-realm";

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var getUsersResponse = await _httpClient.GetAsync($"{keycloakUrl}/admin/realms/{realm}/users?username={email}&exact=true");
            var usersJson = await getUsersResponse.Content.ReadAsStringAsync();
            var users = JsonConvert.DeserializeObject<dynamic[]>(usersJson);
            
            if (users == null || users.Length == 0) 
            {
                throw new Exception($"User with email {email} not found in Keycloak.");
            }
            
            string userId = users[0].id;

            var passwordPayload = new
            {
                type = "password",
                value = newPassword,
                temporary = false // Set to false because our app handles RequiresPasswordChange flag
            };
            var passwordContent = new StringContent(JsonConvert.SerializeObject(passwordPayload), Encoding.UTF8, "application/json");
            var passwordResponse = await _httpClient.PutAsync($"{keycloakUrl}/admin/realms/{realm}/users/{userId}/reset-password", passwordContent);

            if (!passwordResponse.IsSuccessStatusCode)
            {
                var err = await passwordResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to set temporary password in Keycloak: {err}");
            }
        }
    }
}
