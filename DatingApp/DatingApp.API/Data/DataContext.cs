using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace DatingApp.API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        { }

        public DbSet<Value> Values { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Photo> Photos {get; set;}
        public DbSet<Like> Likes {get; set;}

                protected override void OnModelCreating(ModelBuilder builder)
        {
            // this is necesary to set a self many 2 many relationship
            // becouse ef convention is not able to solve by him self
            // esto es por que en las relaciones m2n la tabla intermedia tiene 2 ids que actuan juntos como primary key
            // las convenciones solo sirven para resolver tablas con un unico campo que actua como primary key.
            builder.Entity<Like>()
                .HasKey(k => new { k.LikerId, k.LikeeId }); // aqui decimos que campos forman la priamry key (izda dcha)

            builder.Entity<Like>() // luego definimos que id va con que objeto (en este caso izda)
               .HasOne(u => u.Liker) // un liker 
               .WithMany(u => u.Likees) // tiene muchos likees o relaciona muchos likees
               .HasForeignKey(u => u.LikerId) // cuya foreign key es likerId
               .OnDelete(DeleteBehavior.Restrict); // esto significa que borrar un like no borra un usuario

            builder.Entity<Like>()
               .HasOne(u => u.Likee)
               .WithMany(u => u.Likers)
               .HasForeignKey(u => u.LikeeId)
               .OnDelete(DeleteBehavior.Restrict);

/*             builder.Entity<Message>()
              .HasOne(u => u.Sender)
              .WithMany(m => m.MessagesSent)
              .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Message>()
              .HasOne(u => u.Recipient)
              .WithMany(m => m.MessagesReceived)
              .OnDelete(DeleteBehavior.Restrict); */
        }
    }
}
