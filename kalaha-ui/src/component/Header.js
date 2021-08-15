import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import icon from '../icons/mancala.png';

function Header() {
return(
<Navbar bg="primary" variant="dark">
<Container>
<Navbar.Brand href="#home">
  <img src={icon} width="30" height="30" class="d-inline-block align-top" alt="" />
  Kalaha/Mancala</Navbar.Brand>
<Nav className="me-auto">
  <Nav.Link href="https://www.wikihow.com/Play-Kalaha">How To Play</Nav.Link>  
</Nav>
</Container>
</Navbar>
)
}

export default Header;