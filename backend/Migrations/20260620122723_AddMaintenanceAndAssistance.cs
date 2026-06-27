using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenanceAndAssistance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.CreateTable(
                name: "assistanceRequests",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    reason = table.Column<string>(type: "text", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetUserID = table.Column<int>(type: "integer", nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_assistanceMessages_AssistanceRequestID",
                table: "assistanceMessages",
                column: "AssistanceRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_assistanceRequests_TargetUserID",
                table: "assistanceRequests",
                column: "TargetUserID");

            migrationBuilder.CreateIndex(
                name: "IX_maintenances_motorcycleid",
                table: "maintenances",
                column: "motorcycleid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assistanceMessages");

            migrationBuilder.DropTable(
                name: "maintenances");

            migrationBuilder.DropTable(
                name: "assistanceRequests");

        }
    }
}
