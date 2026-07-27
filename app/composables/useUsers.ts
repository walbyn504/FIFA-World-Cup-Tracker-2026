import type { User } from '~~/shared/types/user'

export const useUsers = () => {
  const { getAll } = useFirestore()

  // Busca todos los usuarios registrados
  const getAllUsers = () => getAll<User>('users')

  return { getAllUsers }
}
