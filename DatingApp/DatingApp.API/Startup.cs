using DatingApp.API.Data;
using DatingApp.API.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;

namespace DatingApp.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the IoC container.
        public void ConfigureServices(IServiceCollection services)
        {
            string connectionString = Configuration.GetConnectionString("DefaultConnection");
            if (connectionString == null)
                connectionString = "Data Source=datingapp.db";

            services.AddDbContext<DataContext>(x => x.UseSqlite(connectionString));
            //services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1) // esto es para version 3.0
            //    .AddJsonOptions(opt =>
            //    {
            //        opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            //    });

            services.AddControllers().AddNewtonsoftJson(); // esta linea ha necesitado instalar previamente Microsoft.AspNetCore.Mvc.NewtonsoftJson el cual a desinstalado cierta cantidad de paquetes. 
            services.AddCors();
            services.Configure<CloudinarySettings>(Configuration.GetSection("CloudinarySettings"));
            services.AddAutoMapper(typeof(DatingRepository).Assembly); // automapper necesita que le indiquemos de que o para que ensamblado vamos a obtener el automapper
            services.AddTransient<Seed>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IDatingRepository, DatingRepository>();
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.ASCII.GetBytes(Configuration.GetSection("AppSettings:Token").Value)),
                        ValidateIssuer = false,
                        ValidateAudience = false
                    };
                });
            // usamos un addscoped por que queremos instaciarlo cada solicitud del usuario
            // el LogUSerActivity es un ejemplo de action filter
            // para usar este servicio en un controlador solo lo añadimos como atributo de la clase ejemplo: UsersController
            services.AddScoped<LogUserActivity>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(builder => {
                    builder.Run(async context =>{
                        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                        var error = context.Features.Get<IExceptionHandlerFeature>();
                        if (error != null)
                        {
                            context.Response.AddApplicationError(error.Error.Message);
                            await context.Response.WriteAsync(error.Error.Message);
                        }
                    });
                });
                //app.UseHsts();
            }

            //app.UseHttpsRedirection();
            // este bloque se ha de ejecutar exactamente en este orden.
            app.UseRouting();
            // important this line has to be after UseRouting & before UseAuthorization
            // apartir de la version 3.0 de net core es necesario usar estas dos sentencias en este orden despues de UseCors
            app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()); 
            app.UseAuthentication(); 
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
