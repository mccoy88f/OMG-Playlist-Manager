import React from 'react';
import { useStore } from '@/store';
import { Outlet } from 'react-router-dom';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const { toast, modal, clearToast, closeModal } = useStore(state => ({
    toast: state.ui.toast,
    modal: state.ui.modal,
    clearToast: state.ui.clearToast,
    closeModal: state.ui.closeModal
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={clearToast}
        />
      )}

      {/* Modal */}
      {modal && (
        <Modal 
          isOpen={true}
          onClose={closeModal}
          {...modal}
        />
      )}
    </div>
  );
}
