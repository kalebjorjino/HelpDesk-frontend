import Swal from 'sweetalert2';

export function useSweetAlert() {

  const showSuccess = (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  const showError = (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonText: 'Cerrar',
    });
  };

  const confirmDelete = async (title: string = '¿Estás seguro?', text: string = 'No podrás revertir esta acción.') => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    return result.isConfirmed;
  };

  return {
    showSuccess,
    showError,
    confirmDelete,
  };
}
