using Microsoft.EntityFrameworkCore;
using projeto.Data.Models;
using Task = projeto.Data.Models.Task;

namespace projeto.Data
{
    public class AMoverContext : DbContext
    {
        public AMoverContext(DbContextOptions<AMoverContext> options)
        : base(options)
        {
        }

        public DbSet<User> users { get; set; }
        public DbSet<Vehicle> vehicles { get; set; }
        public DbSet<Company> companies { get; set; }
        public DbSet<Task> tasks { get; set; }
        public DbSet<Service> services { get; set; }
        //public DbSet<PerformanceReport> reports { get; set; }
        public DbSet<Alert> alerts { get; set; }
        public DbSet<Models.LocationNode> routes { get; set; }
        public DbSet<LocationNode> locationNodes { get; set; }
        public DbSet<CanceledRouteLog> canceledRouteLogs { get; set; }
        public DbSet<ApiKey> apiKeys { get; set; }
        public DbSet<MessageLog> messageLogs { get; set; }
        public DbSet<Client> clients { get; set; }
        public DbSet<Maintenance> maintenances { get; set; }
        public DbSet<AssistanceRequest> assistanceRequests { get; set; }
        public DbSet<AssistanceMessage> assistanceMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasMany(u => u.vehicles)
                .WithOne(v => v.owner)
                .HasForeignKey(v => v.ownerID)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<User>()
                .HasMany(u => u.targetedAlerts)
                .WithMany(a => a.targets);
            modelBuilder.Entity<User>()
                .HasMany(u => u.managedAlerts)
                .WithOne(a => a.admin)
                .HasForeignKey(a => a.adminID)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasMany(u => u.plans)
                .WithOne(p => p.user)
                .HasForeignKey(p => p.userID)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasMany(u => u.tasks)
                .WithOne(t => t.user)
                .HasForeignKey(t => t.userID)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Plan>()
                .HasMany(p => p.tasks)
                .WithOne(t => t.plan)
                .HasForeignKey(t => t.planID)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Task>()
                .HasMany(t => t.Nodes)
                .WithMany(n => n.tasks)
                .UsingEntity<LocationNodeTask>(
                    j => j
                        .HasOne(pt => pt.LocationNode)
                        .WithMany(t => t.LocationNodeTasks)
                        .HasForeignKey(pt => pt.NodeID),
                    j => j
                        .HasOne(pt => pt.Task)
                        .WithMany(p => p.LocationNodeTasks)
                        .HasForeignKey(pt => pt.TaskID),
                    j =>
                    {
                        j.HasKey(t => new { t.NodeID, t.TaskID });
                    });

            //modelBuilder.Entity<Task>()
            //    .HasMany(t => t.subTasks)
            //    .WithOne(t => t.parentTask)
            //    .HasForeignKey(t => t.parentTaskID);
            modelBuilder.Entity<Task>()
                .HasOne(t => t.service)
                .WithMany(s => s.tasks)
                .HasForeignKey(t => t.serviceID)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Task>()
                .HasOne(t => t.client)
                .WithMany(c => c.tasks)
                .HasForeignKey(t => t.clientID)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Task>()
                .Property(t => t.recurrence)
                .HasConversion<string>();
            //modelBuilder.Entity<Models.LocationNode>()
            //    .HasMany(r => r.nodes)
            //    .WithMany(n => n.routes);
            modelBuilder.Entity<Company>()
                .HasMany(c => c.users)
                .WithOne(u => u.company)
                .HasForeignKey(u => u.companyID)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Company>()
                .HasMany(s => s.services)
                .WithOne(u => u.company)
                .HasForeignKey(u => u.companyID)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}
