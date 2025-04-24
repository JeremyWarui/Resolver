import { gql, useMutation } from '@apollo/client';

const UPDATE_TICKET = gql`
  mutation UpdateTicket($id: ID!, $input: TicketInput!) {
    updateTicket(id: $id, input: $input) {
      id
      ticket_no
      title
      description
      section
      facility
      status
      raisedBy
      assignedTo
      createdAt
      updatedAt
    }
  }
`;

export default function useUpdateTicket() {
  const [updateTicket, { loading, error }] = useMutation(UPDATE_TICKET);
  
  const executeUpdate = async (ticketData: any) => {
    try {
      const { id, ...updateData } = ticketData;
      const { data } = await updateTicket({
        variables: {
          id,
          input: updateData,
        },
      });
      return data.updateTicket;
    } catch (err) {
      console.error('Error updating ticket:', err);
      throw err;
    }
  };
  
  return {
    updateTicket: executeUpdate,
    loading,
    error,
  };
}