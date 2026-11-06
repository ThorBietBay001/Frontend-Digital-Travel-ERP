import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';

export default function Root() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
