import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const NavLink = ({ to, label, active }) => (
    <Link
        to={to}
        className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ease-out ${active
            ? 'text-[#C48B28]'
            : 'text-[#402E11]/40 hover:text-[#402E11]'
            }`}
    >
        {label}
        {active && (
            <motion.div
                layoutId="activeNav"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#C48B28] rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
        )}
    </Link>
);

NavLink.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool,
};

export default NavLink;
