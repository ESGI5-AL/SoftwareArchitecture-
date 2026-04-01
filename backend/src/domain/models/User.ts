export interface User {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role: 'employee' | 'secretary' | 'manager'
  vehicleType: 'regular' | 'electric' | 'hybrid'
  licensePlate?: string
  isActive: boolean
  createdAt: Date
}

// What we return to clients (no passwordHash)
export type UserDTO = Omit<User, 'passwordHash'>
