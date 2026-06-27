using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class AddClientCompanyId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "companyID",
                table: "clients",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_clients_companyID",
                table: "clients",
                column: "companyID");

            migrationBuilder.AddForeignKey(
                name: "FK_clients_companies_companyID",
                table: "clients",
                column: "companyID",
                principalTable: "companies",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_clients_companies_companyID",
                table: "clients");

            migrationBuilder.DropIndex(
                name: "IX_clients_companyID",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "companyID",
                table: "clients");
        }
    }
}
