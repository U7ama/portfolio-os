import './App.css';
import Desktop from './components/os/Desktop';
import { PortfolioContentProvider } from './content/PortfolioContent';

function App() {
    return (
        <PortfolioContentProvider>
            <div className="App">
                <Desktop />
            </div>
        </PortfolioContentProvider>
    );
}

export default App;
