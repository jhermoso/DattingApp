using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection; // necesario para acceder a Getservice dentro del contenedor de IoC

namespace DatingApp.API.Helpers
{
    // ejemplo de action filter para mantener actualizado el campo de ultima actividad de un usuario
    public class LogUserActivity : IAsyncActionFilter
    {
        // el primer parametro es que queremos hacer cuando la acción se esta ejecutando
        // el segundo nos permite ejecutar un metodo, acción a callback cuando la acción ha sido ejecutada  
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // ejecutamos de froma asincrona el metodo next que hemos pasado como parametro y guardamos el resultado en una variable.
            // es decir esperamos a que la acción haya sido completada.
            var resultContext = await next();

            // obtenemos el id del usario consultanto el claim principal que hace referencia al usuario
            var userId = int.Parse(resultContext.HttpContext.User
               .FindFirst(ClaimTypes.NameIdentifier).Value);

            // utilizamos el IoC container para recuperar el servicio del repositorio
            var repo = resultContext.HttpContext.RequestServices.GetService<IDatingRepository>();
            var user = await repo.GetUser(userId);
            user.LastActive = DateTime.Now;
            await repo.SaveAll();
        }
    }
}