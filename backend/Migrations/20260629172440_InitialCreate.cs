using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "apiKeys",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Owner = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_apiKeys", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "canceledRouteLogs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RouteGroupId = table.Column<string>(type: "text", nullable: false),
                    VehicleID = table.Column<int>(type: "integer", nullable: false),
                    CancelationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: false),
                    ReturnedToUnassigned = table.Column<bool>(type: "boolean", nullable: false),
                    TaskIds = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_canceledRouteLogs", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "companies",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_companies", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "LocationNode",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    latitude = table.Column<float>(type: "real", nullable: false),
                    longintude = table.Column<float>(type: "real", nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    availableTimeStart = table.Column<TimeSpan>(type: "interval", nullable: true),
                    availableTimeEnds = table.Column<TimeSpan>(type: "interval", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationNode", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "messageLogs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VehicleVID = table.Column<string>(type: "text", nullable: false),
                    Sender = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messageLogs", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    nif = table.Column<string>(type: "text", nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    street = table.Column<string>(type: "text", nullable: true),
                    door_number = table.Column<string>(type: "text", nullable: true),
                    floor = table.Column<string>(type: "text", nullable: true),
                    postal_code = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    companyID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.ID);
                    table.ForeignKey(
                        name: "FK_clients_companies_companyID",
                        column: x => x.companyID,
                        principalTable: "companies",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    category = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    companyID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_services", x => x.ID);
                    table.ForeignKey(
                        name: "FK_services_companies_companyID",
                        column: x => x.companyID,
                        principalTable: "companies",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    driverLicense = table.Column<string>(type: "text", nullable: true),
                    citizenCard = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "text", nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    photoUrl = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresPasswordChange = table.Column<bool>(type: "boolean", nullable: false),
                    auth_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    nif = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    companyID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.ID);
                    table.ForeignKey(
                        name: "FK_users_companies_companyID",
                        column: x => x.companyID,
                        principalTable: "companies",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "alerts",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    description = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    adminID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alerts", x => x.ID);
                    table.ForeignKey(
                        name: "FK_alerts_users_adminID",
                        column: x => x.adminID,
                        principalTable: "users",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assistanceRequests",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    reason = table.Column<string>(type: "text", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetUserID = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assistanceRequests", x => x.ID);
                    table.ForeignKey(
                        name: "FK_assistanceRequests_users_TargetUserID",
                        column: x => x.TargetUserID,
                        principalTable: "users",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Plan",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    isOptimized = table.Column<bool>(type: "boolean", nullable: false),
                    userID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plan", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Plan_users_userID",
                        column: x => x.userID,
                        principalTable: "users",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VID = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    brand = table.Column<string>(type: "text", nullable: false),
                    model = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    batteryCapacity = table.Column<float>(type: "real", nullable: false),
                    cargoCapacity = table.Column<float>(type: "real", nullable: false),
                    plate = table.Column<string>(type: "text", nullable: true),
                    maintenance_reason = table.Column<string>(type: "text", nullable: true),
                    maintenance_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ownerID = table.Column<int>(type: "integer", nullable: true),
                    companyID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicles", x => x.ID);
                    table.ForeignKey(
                        name: "FK_vehicles_companies_companyID",
                        column: x => x.companyID,
                        principalTable: "companies",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_vehicles_users_ownerID",
                        column: x => x.ownerID,
                        principalTable: "users",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "AlertUser",
                columns: table => new
                {
                    targetedAlertsID = table.Column<int>(type: "integer", nullable: false),
                    targetsID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertUser", x => new { x.targetedAlertsID, x.targetsID });
                    table.ForeignKey(
                        name: "FK_AlertUser_alerts_targetedAlertsID",
                        column: x => x.targetedAlertsID,
                        principalTable: "alerts",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlertUser_users_targetsID",
                        column: x => x.targetsID,
                        principalTable: "users",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assistanceMessages",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AssistanceRequestID = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(type: "text", nullable: false),
                    sender = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assistanceMessages", x => x.ID);
                    table.ForeignKey(
                        name: "FK_assistanceMessages_assistanceRequests_AssistanceRequestID",
                        column: x => x.AssistanceRequestID,
                        principalTable: "assistanceRequests",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "maintenances",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    motorcycleid = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    resolved = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_maintenances", x => x.ID);
                    table.ForeignKey(
                        name: "FK_maintenances_vehicles_motorcycleid",
                        column: x => x.motorcycleid,
                        principalTable: "vehicles",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tasks",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    type = table.Column<string>(type: "text", nullable: false),
                    creationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    availableTimeStart = table.Column<TimeSpan>(type: "interval", nullable: true),
                    availableTimeEnds = table.Column<TimeSpan>(type: "interval", nullable: true),
                    recurrence = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    userID = table.Column<int>(type: "integer", nullable: true),
                    planID = table.Column<int>(type: "integer", nullable: true),
                    vehicleID = table.Column<int>(type: "integer", nullable: true),
                    serviceID = table.Column<int>(type: "integer", nullable: false),
                    clientID = table.Column<int>(type: "integer", nullable: false),
                    street = table.Column<string>(type: "text", nullable: true),
                    door_number = table.Column<string>(type: "text", nullable: true),
                    floor = table.Column<string>(type: "text", nullable: true),
                    postal_code = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: true),
                    instructions = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tasks", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tasks_Plan_planID",
                        column: x => x.planID,
                        principalTable: "Plan",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tasks_clients_clientID",
                        column: x => x.clientID,
                        principalTable: "clients",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tasks_services_serviceID",
                        column: x => x.serviceID,
                        principalTable: "services",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tasks_users_userID",
                        column: x => x.userID,
                        principalTable: "users",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tasks_vehicles_vehicleID",
                        column: x => x.vehicleID,
                        principalTable: "vehicles",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "LocationNodeTask",
                columns: table => new
                {
                    NodeID = table.Column<int>(type: "integer", nullable: false),
                    TaskID = table.Column<int>(type: "integer", nullable: false),
                    stopOrder = table.Column<int>(type: "integer", nullable: false),
                    RouteGroupId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationNodeTask", x => new { x.NodeID, x.TaskID });
                    table.ForeignKey(
                        name: "FK_LocationNodeTask_LocationNode_NodeID",
                        column: x => x.NodeID,
                        principalTable: "LocationNode",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LocationNodeTask_tasks_TaskID",
                        column: x => x.TaskID,
                        principalTable: "tasks",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_alerts_adminID",
                table: "alerts",
                column: "adminID");

            migrationBuilder.CreateIndex(
                name: "IX_AlertUser_targetsID",
                table: "AlertUser",
                column: "targetsID");

            migrationBuilder.CreateIndex(
                name: "IX_assistanceMessages_AssistanceRequestID",
                table: "assistanceMessages",
                column: "AssistanceRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_assistanceRequests_TargetUserID",
                table: "assistanceRequests",
                column: "TargetUserID");

            migrationBuilder.CreateIndex(
                name: "IX_clients_companyID",
                table: "clients",
                column: "companyID");

            migrationBuilder.CreateIndex(
                name: "IX_LocationNodeTask_TaskID",
                table: "LocationNodeTask",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_maintenances_motorcycleid",
                table: "maintenances",
                column: "motorcycleid");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_userID",
                table: "Plan",
                column: "userID");

            migrationBuilder.CreateIndex(
                name: "IX_services_companyID",
                table: "services",
                column: "companyID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_clientID",
                table: "tasks",
                column: "clientID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_planID",
                table: "tasks",
                column: "planID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_serviceID",
                table: "tasks",
                column: "serviceID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_userID",
                table: "tasks",
                column: "userID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_vehicleID",
                table: "tasks",
                column: "vehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_users_companyID",
                table: "users",
                column: "companyID");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_companyID",
                table: "vehicles",
                column: "companyID");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_ownerID",
                table: "vehicles",
                column: "ownerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertUser");

            migrationBuilder.DropTable(
                name: "apiKeys");

            migrationBuilder.DropTable(
                name: "assistanceMessages");

            migrationBuilder.DropTable(
                name: "canceledRouteLogs");

            migrationBuilder.DropTable(
                name: "LocationNodeTask");

            migrationBuilder.DropTable(
                name: "maintenances");

            migrationBuilder.DropTable(
                name: "messageLogs");

            migrationBuilder.DropTable(
                name: "alerts");

            migrationBuilder.DropTable(
                name: "assistanceRequests");

            migrationBuilder.DropTable(
                name: "LocationNode");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "Plan");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropTable(
                name: "vehicles");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "companies");
        }
    }
}
