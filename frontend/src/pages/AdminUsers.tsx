import { useEffect, useState } from 'react';
import { useAuth } from '../services/Autenticate';
import { toast } from 'react-toastify';
import CreateUserModal from '../components/CreateUserModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteUserModal';
import EditUserModal from '../components/EditUserModal';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}
//Funcion para la administracion de usuarios solo para admins 
export default function AdminUserList() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [filterName, setFilterName] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    useEffect(() => {
        if (!token) return;
        fetchUsers();
    }, [token, page, filterName, filterEmail, filterRole]);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/auth/admin/users`);
            url.searchParams.set('page', page.toString());
            url.searchParams.set('limit', limit.toString());
            if (filterName) url.searchParams.set('name', filterName);
            if (filterEmail) url.searchParams.set('email', filterEmail);
            if (filterRole) url.searchParams.set('role', filterRole);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Error al cargar usuarios');

            const data = await res.json();
            setUsers(data.data);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }
    async function deleteUser(userId: number) {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Error al eliminar usuario');

            toast.success('Usuario eliminado correctamente');
            fetchUsers(); // refrescar
        } catch (err: any) {
            toast.error(err.message || 'Error eliminando usuario');
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    }
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <>
        <PageTitle title='Administar Usuarios'/>
        <div className="p-4 bg-gray-800 rounded-md text-white">
            <h2 className="text-2xl mb-4">Administración de Usuarios</h2>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white w-full sm:w-auto"
                >
                    + Crear Usuario
                </button>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                <input
                    placeholder="Nombre"
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                    className="px-3 py-1 bg-gray-700 rounded w-full sm:w-auto"
                />
                <input
                    placeholder="Email"
                    value={filterEmail}
                    onChange={e => setFilterEmail(e.target.value)}
                    className="px-3 py-1 bg-gray-700 rounded w-full sm:w-auto"
                />
                <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="px-3 py-1 bg-gray-700 rounded w-full sm:w-auto"
                >
                    <option value="">Todos los roles</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
                <button
                    onClick={() => setPage(1)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded w-full sm:w-auto"
                >
                    Aplicar filtros
                </button>
            </div>

            {/* Tabla de usuarios */}
            {loading ? (
                <Loader/>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : users.length === 0 ? (
                <p>No se encontraron usuarios</p>
            ) : (
                <>
                    {/* Tabla solo visible en pantallas grandes */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full bg-gray-700 rounded text-center text-sm">
                            <thead>
                                <tr className="bg-gray-600">
                                    <th className="py-2 px-4">ID</th>
                                    <th className="py-2 px-4">Nombre</th>
                                    <th className="py-2 px-4">Email</th>
                                    <th className="py-2 px-4">Rol</th>
                                    <th className="py-2 px-4">Creado</th>
                                    <th className="py-2 px-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="even:bg-gray-800">
                                        <td className="py-2 px-4">{u.id}</td>
                                        <td className="py-2 px-4">{u.name}</td>
                                        <td className="py-2 px-4">{u.email}</td>
                                        <td className="py-2 px-4 capitalize">{u.role}</td>
                                        <td className="py-2 px-4">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-2 px-4 space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(u);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 px-3 py-1  mb-1 rounded text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tarjetas solo visibles en móvil */}
                    <div className="block sm:hidden space-y-4">
                        {users.map((u) => (
                            <div key={u.id} className="bg-gray-700 rounded p-4 shadow-md">
                                <h3 className="text-lg font-bold mb-2">{u.name}</h3>
                                <p className="text-sm text-gray-300"><span className="font-semibold">Email:</span> {u.email}</p>
                                <p className="text-sm text-gray-300"><span className="font-semibold">Rol:</span> {u.role}</p>
                                <p className="text-sm text-gray-300"><span className="font-semibold">Creado:</span> {new Date(u.createdAt).toLocaleDateString()}</p>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingUser(u);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm text-white"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Paginación */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
                >
                    ‹ Anterior
                </button>

                {pageNumbers.map(pn => (
                    <button
                        key={pn}
                        onClick={() => setPage(pn)}
                        className={`px-3 py-1 rounded ${pn === page ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                    >
                        {pn}
                    </button>
                ))}

                <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
                >
                    Siguiente ›
                </button>

            </div>
            {token && (
                <CreateUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUserCreated={fetchUsers}
                    token={token}
                />
            )}
            {selectedUser && (
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => deleteUser(selectedUser.id)}
                    userName={selectedUser.name}
                />
            )}
            {editingUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={editingUser}
                    token={token!}
                    onUserUpdated={fetchUsers}
                />
            )}
        </div>
        </>
    );
}
