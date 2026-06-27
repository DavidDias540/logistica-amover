using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleCompanyId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "companyID",
                table: "vehicles",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_companyID",
                table: "vehicles",
                column: "companyID");

            migrationBuilder.AddForeignKey(
                name: "FK_vehicles_companies_companyID",
                table: "vehicles",
                column: "companyID",
                principalTable: "companies",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_vehicles_companies_companyID",
                table: "vehicles");

            migrationBuilder.DropIndex(
                name: "IX_vehicles_companyID",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "companyID",
                table: "vehicles");
        }
    }
}
