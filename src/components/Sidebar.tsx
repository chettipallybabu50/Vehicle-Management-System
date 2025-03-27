
// components/Sidebar.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { FiGrid, FiHome } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";
import { IoMdHelpCircleOutline } from "react-icons/io";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Open by default on desktop
  const pathname = usePathname();


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true); // Open on desktop
      } else {
        setIsOpen(false); // Closed on mobile
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FiHome /> },
    { name: "Slot Details", path: "/building-wise-slots", icon:<FiGrid /> },
    { name: "Settings", path: "/settings" ,icon:<CiSettings />},
    { name: "Queries", path: "/queries" ,icon: <IoMdHelpCircleOutline/>},
  ];

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? "✕" : "☰"}
      </button>
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            // <li key={item.name}>
            //   <Link
            //     href={item.path}
            //     className={`${styles.menuItem} ${
            //       pathname === item.path ? styles.active : ""
            //     }`}
            //   >
            //     <span className={styles.menuText}>
            //       {isOpen ? item.name : item.name[0]}
            //     </span>
            //   </Link>
            // </li>

            <li key={item.path} className={pathname === item.path ? styles.active : ""}>
            <Link href={item.path} className={styles.menuText}>
              {item.icon}
              {isOpen && <span className={styles.linkText}>{item.name}</span>}
            </Link>
          </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;