import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Drawer from '@components/Drawer'
import Modal from '@components/Modal'
import { AuthProvider } from '@contexts/AuthContext'
import { DrawerProvider } from '@hooks/drawer/DrawerContext'
import { ModalProvider } from '@hooks/modal/ModalContext'

export function RootLayout() {
  return (
    <AuthProvider>
      <ModalProvider>
        <DrawerProvider>
          <div className="min-h-svh bg-background text-foreground">
            <main className="min-h-svh">
              <Suspense
                fallback={
                  <div className="flex min-h-svh items-center justify-center text-sm text-muted">
                    Loading...
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </main>
            <Modal />
            <Drawer />
          </div>
        </DrawerProvider>
      </ModalProvider>
    </AuthProvider>
  )
}
