using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using projeto.Controllers;
using projeto.Data;
using projeto.Data.Models;
using projeto.Services;
using System.IdentityModel.Tokens.Jwt;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// Autenticação com o Keycloak
var keycloakAuthority = builder.Configuration["Keycloak:Authority"] ?? "http://localhost:8080/realms/amover-realm";
var keycloakAudience = builder.Configuration["Keycloak:Audience"] ?? "amover-api";
var requireHttps = builder.Configuration.GetValue<bool>("Keycloak:RequireHttpsMetadata", false);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloakAuthority; 
        options.RequireHttpsMetadata = requireHttps;
        options.Audience = keycloakAudience; 
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidAudience = keycloakAudience,
            ValidateIssuer = false, 
            ValidIssuer = keycloakAuthority,
            NameClaimType = "email",
            RoleClaimType = "role"
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                var principal = context.Principal;
                logger.LogInformation($"Token validated. Claims: {string.Join(", ", principal?.Claims.Select(c => $"{c.Type}={c.Value}") ?? [])}");
                var identity = principal?.Identity as System.Security.Claims.ClaimsIdentity;
                if (identity != null)
                {
                    var realmAccessClaim = identity.FindFirst("realm_access");
                    if (realmAccessClaim != null)
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(realmAccessClaim.Value);
                        if (doc.RootElement.TryGetProperty("roles", out var rolesElement))
                        {
                            foreach (var role in rolesElement.EnumerateArray())
                            {
                                identity.AddClaim(new System.Security.Claims.Claim("role", role.GetString()!));
                            }
                        }
                    }
                }
                return System.Threading.Tasks.Task.CompletedTask;
            }
        };
    });


// Configuração do Swagger + botão Authorize
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "AMoVeR API", Version = "v1" });

    //SUPORTE JWT NO SWAGGER
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT (sem 'Bearer ' antes)."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] { }
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // URL da Plataforma de Gestão
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.MaxDepth = 64;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;

    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDbContext<AMoverContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// Add Http Client for Keycloak
builder.Services.AddHttpClient();

// Add Scoped Services
builder.Services.AddScoped<UserServices>();
builder.Services.AddScoped<UserTaskServices>();
builder.Services.AddScoped<RouteServices>();
builder.Services.AddScoped<MessageServices>();
builder.Services.AddScoped<ClientServices>();
builder.Services.AddScoped<VehicleServices>();
builder.Services.AddScoped<CompanyServices>();
builder.Services.AddScoped<KeycloakAdminService>();
builder.Services.AddScoped<DatabaseOperations>();
builder.Services.AddScoped<AlertServices>();
builder.Services.AddScoped<TaskServices>();
builder.Services.AddScoped<NodeServices>();
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

    // Aplicar as migrações automaticamente à base de dados nova no arranque
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AMoverContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        int retries = 5;
        while (retries > 0)
        {
            try
            {
                db.Database.Migrate();
                logger.LogInformation("Migrações verificadas/aplicadas com sucesso.");
                break; // Sucesso, sai do loop
            }
            catch (Exception ex)
            {
                retries--;
                if (retries == 0)
                {
                    logger.LogError(ex, "Erro fatal: Não foi possível ligar à base de dados após várias tentativas. A aplicação vai arrancar, mas pode não funcionar.");
                }
                else
                {
                    logger.LogWarning($"A base de dados ainda não está pronta. Tentativas restantes: {retries}. A aguardar 5 segundos...");
                    System.Threading.Thread.Sleep(5000);
                }
            }
        }
    }

// Configure pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
