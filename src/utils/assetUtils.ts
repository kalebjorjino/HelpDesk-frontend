export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'green';
    case 'IN_REPAIR': return 'orange';
    case 'DISPOSED': return 'red';
    default: return 'grey';
  }
};
