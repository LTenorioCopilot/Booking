using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAppClients.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameCustomers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Clientes",
                newName: "Customers");

            migrationBuilder.RenameColumn(
                name: "TipoDocumento",
                table: "Customers",
                newName: "DocumentType");

            migrationBuilder.RenameIndex(
                name: "IX_Clientes_Email",
                table: "Customers",
                newName: "IX_Customers_Email");

            migrationBuilder.RenameIndex(
                name: "IX_Clientes_NumeroDocumento",
                table: "Customers",
                newName: "IX_Customers_NumeroDocumento");

            migrationBuilder.Sql("EXEC sp_rename 'PK_Clientes', 'PK_Customers';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("EXEC sp_rename 'PK_Customers', 'PK_Clientes';");

            migrationBuilder.RenameIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                newName: "IX_Clientes_Email");

            migrationBuilder.RenameIndex(
                name: "IX_Customers_NumeroDocumento",
                table: "Customers",
                newName: "IX_Clientes_NumeroDocumento");

            migrationBuilder.RenameColumn(
                name: "DocumentType",
                table: "Customers",
                newName: "TipoDocumento");

            migrationBuilder.RenameTable(
                name: "Customers",
                newName: "Clientes");
        }
    }
}
