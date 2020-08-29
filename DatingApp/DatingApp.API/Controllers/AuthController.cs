using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices.WindowsRuntime;
using DatingApp.API.Models;
using DatingApp.API.Dtos;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using AutoMapper;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public AuthController(IAuthRepository repo, IConfiguration config, IMapper mapper)
        {
            this._repo = repo;
            this._config = config;
            this._mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserForRegisterDto userForRegisterDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // preconditions
            if (userForRegisterDto is null || userForRegisterDto.UserName is null || userForRegisterDto.Password is null) { return BadRequest("User name or password are empty"); }

            userForRegisterDto.UserName = userForRegisterDto.UserName.ToLower();
            if (await _repo.UserExists(userForRegisterDto.UserName))
            {
                return BadRequest("User Name already exists");
            }

            var userToCreate = _mapper.Map<User>(userForRegisterDto); //new User
            //{
            //    UserName = userForRegisterDto.UserName
            //};

            var createdUser = await _repo.Register(userToCreate, userForRegisterDto.Password);

            // este campo lo usamos solo para devolver el usuario que acabamos de registrar.
            // pero el createdUser contiene el paswword asi que para evitar el devolver el usuario
            // con información de paswword creamos un nuevo usuario desde un mapping eliminando
            // la inforamcion de password
            var userToReturn = _mapper.Map<UserForDetailedDto>(createdUser);

            // why to use createdatroute https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
            // en este caso devolvemos la ruta del controlador Users el metodo get cuyo nombre es "GetUser"
            // con el parametro id y el propio objeto a devolver.
            // esta es una condición de las api que siguen las directrices de restfull.
            // que es devolver la ruta en la que se puede comprobar el objeto recien creado.
            // aqui podemos ver un ejemplo de por que json no pone el nombre del componente raiz
            // y es para permitir el uso de metodos anonimos o la contrucción de objetos anonimos 
            // como el que hace el new de la sentencia.
            return CreatedAtRoute("GetUser", new { controller = "Users", id = createdUser.Id }, userToReturn);
            //return StatusCode(201); //CreatedAtRoute()
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {
            var userFromRepo = await _repo.Login(userForLoginDto.UserName.ToLower(), userForLoginDto.Password);

            if (userFromRepo is null)
                return Unauthorized(); // no se proporciona mas información para evitar ataques de fuerza bruta


            // creamos parte de la carga util de nuestro token de seguridad
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userFromRepo.Id.ToString()),
                new Claim(ClaimTypes.Name, userFromRepo.UserName)
            };

            // con esto estamos firmando nuestro token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("AppSettings:Token").Value)); // obtenemos nuestra firma codificada
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature); // obtenemos las credenciales con la firma anterior

            // con la cabecera y el payload ya podemos crear el token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity (claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            // ahora podemos crear la version JWT del token para poder transmitirlo dentro de un json
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            var user = _mapper.Map<UserForListDto>(userFromRepo);
            return Ok(new
            {
                token = tokenHandler.WriteToken(token),

                // en este punto vamos a devolver la foto del usuario
                // que almacenaremos en el local storage con objeto de
                // poder visualizarlo en la barra de navegación
                // esta foto no se incluye en el token de autenticación si no 
                // simplemente se añade a la respuesta del login como un objeto adicional 
                user
            });
        }

    }
}
