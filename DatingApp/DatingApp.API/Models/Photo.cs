using System;

namespace DatingApp.API.Models
{
    public class Photo
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string MyProperty { get; set; }
        public string Description {get; set;}
        public DateTime DateAdded {get; set;}
        public bool IsMain {get; set;}

        // Cloudinary Id 
        public string PublicId { get; set; }
        // con estas dos propiedades explicitas acerca de la relación entre Photos y 
        // user estamos haciendo que EF establezca la relación con "Cascade delete"
        // esto se debe a que EF no tiene que inferir la existencia de estos dos campos
        // y por tanto no los hace nullables, al no hacerlos nullables tal y como
        // estamos declarando aqui significa que su ciclo de vida depende del padre
        // en este caso User y EF establcera que se pueden borrar photos individualmente
        // pero si se borra un usuario todas sus fotos se borraran en cascada.
        
        public User User {get; set;}

        public int UserId {get; set;}
    }
}