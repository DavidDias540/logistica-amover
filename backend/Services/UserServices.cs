using projeto.Data;
using projeto.Data.Models;
using Microsoft.EntityFrameworkCore; // Adicionado para suporte a consultas mais complexas

namespace projeto.Services
{
    public class UserServices
    {
        private readonly AMoverContext _context;
        public UserServices(AMoverContext context)
        {
            _context = context;
        }

        public User? GetUserByEmail(string email)
        {
            try
            {
                return _context.users.FirstOrDefault(u => u.email == email);
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao procurar utilizador por email: " + ex.Message);
            }
        }

        public void CreateUser(User u, int? companyID)
        {
            try
            {
                // 1. Associamos o ID da empresa ao objeto utilizador
                u.companyID = companyID;

                // 2. Verificamos se o email já existe
                if (_context.users.Any(x => x.email == u.email))
                {
                    throw new Exception("Já existe um utilizador com este email.");
                }

                _context.users.Add(u);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao criar utilizador: " + ex.Message);
            }
        }

        public List<User> GetUsers()
        {
            try
            {
                return _context.users.ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao obter lista de utilizadores: " + ex.Message);
            }
        }

        public User GetUserByID(int id)
        {
            try
            {
                var target = _context.users.FirstOrDefault(x => x.ID == id);
                if (target == null)
                {
                    throw new Exception("Utilizador não encontrado.");
                }
                return target;
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao obter o utilizador: " + ex.Message);
            }
        }

        public bool EditUser(User u)
        {
            try
            {
                var target = _context.users.FirstOrDefault(x => x.ID == u.ID);
                if (target == null)
                {
                    return false;
                }
                target.name = u.name;
                target.email = u.email;
                target.password = u.password;
                target.role = u.role;
                target.driverLicense = u.driverLicense;
                target.citizenCard = u.citizenCard;
                target.phone = u.phone;
                target.address = u.address;
                target.photoUrl = u.photoUrl;
                target.is_active = u.is_active;
                target.companyID = u.companyID;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao editar o utilizador: " + ex.Message);
            }
        }

        public bool DeleteUser(int userId)
        {
            try
            {
                var target = _context.users.FirstOrDefault(x => x.ID == userId);
                if (target == null)
                {
                    return false;
                }
                _context.users.Remove(target);
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao eliminar o utilizador: " + ex.Message);
            }
        }
    }
}