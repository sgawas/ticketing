import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  console.log(tickets);

  const ticketList = tickets.map(ticket=> {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
};
// context will contain req object.
LandingPage.getInitialProps = async (context, client, currentUser) => {
  // when we use axios to fetch data we get res object with data field in it, hence destructured
  const { data } = await client.get('/api/tickets');

  // this tickets will be merged to props passed to landing page, hence at top we have  { currentUser, tickets} 
  return { tickets : data };
};

export default LandingPage;
