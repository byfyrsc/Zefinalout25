import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../Protected'

vi.mock('@/contexts/AuthContext', () => {
  return {
    useAuth: vi.fn(),
  }
})

const { useAuth } = await import('@/contexts/AuthContext')

function renderWithRouter(ui: React.ReactNode, initialEntries = ['/protected']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders loading state when loading is true', () => {
    ;(useAuth as any).mockReturnValue({ user: null, loading: true })
    renderWithRouter(<div />)
    expect(screen.getByText(/Verificando autenticação/i)).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    ;(useAuth as any).mockReturnValue({ user: null, loading: false })
    renderWithRouter(<div />)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    ;(useAuth as any).mockReturnValue({ user: { id: 'u' }, loading: false, hasRole: () => true, hasPermission: () => true })
    renderWithRouter(<div />)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('blocks when requiredRole not satisfied', () => {
    ;(useAuth as any).mockReturnValue({ user: { id: 'u' }, loading: false, hasRole: () => false, hasPermission: () => true })
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRole={"admin" as any}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/Acesso Negado/i)).toBeInTheDocument()
  })

  it('blocks when requiredPermission not satisfied', () => {
    ;(useAuth as any).mockReturnValue({ user: { id: 'u' }, loading: false, hasRole: () => true, hasPermission: () => false })
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredPermission={"manage_users"}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/Permissão Insuficiente/i)).toBeInTheDocument()
  })
})
