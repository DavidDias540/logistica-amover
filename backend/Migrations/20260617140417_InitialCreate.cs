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
                name: "clients",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    nif = table.Column<string>(type: "text", nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.ID);
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
                    availableTimeEnds = table.Column<TimeSpan>(type: "interval", nullable: true)
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
                    batteryCapacity = table.Column<float>(type: "real", nullable: false),
                    cargoCapacity = table.Column<float>(type: "real", nullable: false),
                    ownerID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicles", x => x.ID);
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
                    serviceID = table.Column<int>(type: "integer", nullable: false),
                    clientID = table.Column<int>(type: "integer", nullable: false)
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
                });

            migrationBuilder.CreateTable(
                name: "LocationNodeTask",
                columns: table => new
                {
                    NodesID = table.Column<int>(type: "integer", nullable: false),
                    tasksID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationNodeTask", x => new { x.NodesID, x.tasksID });
                    table.ForeignKey(
                        name: "FK_LocationNodeTask_LocationNode_NodesID",
                        column: x => x.NodesID,
                        principalTable: "LocationNode",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LocationNodeTask_tasks_tasksID",
                        column: x => x.tasksID,
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
                name: "IX_LocationNodeTask_tasksID",
                table: "LocationNodeTask",
                column: "tasksID");

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
                name: "IX_users_companyID",
                table: "users",
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
                name: "LocationNodeTask");

            migrationBuilder.DropTable(
                name: "messageLogs");

            migrationBuilder.DropTable(
                name: "vehicles");

            migrationBuilder.DropTable(
                name: "alerts");

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
                name: "users");

            migrationBuilder.DropTable(
                name: "companies");
        }
    }
}
