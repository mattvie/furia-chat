import logo from './Furia_Esports_logo.png'

export default function Header() {
    return (
        <header className="App-header" style={{ textAlign: 'center', padding: '1rem' }}>
            <img 
                src={logo}
                alt="FURIA Logo" 
                style={{ maxWidth: '100px', height: 'auto' }} 
            />
        </header>
    );
}