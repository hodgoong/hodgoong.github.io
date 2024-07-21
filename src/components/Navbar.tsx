import Link from 'next/link';

export default function Navbar({ navBarSource }: { navBarSource: NavBarSource }) {
    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-xl">{navBarSource.title}</a>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    {
                        navBarSource.menus.map((menu =>
                            <li key={menu.id}><Link href={menu.path}>{menu.menuTitle}</Link></li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}