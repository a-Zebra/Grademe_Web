import Link from "next/link";
import PropTypes from "prop-types";

export function ButtonLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-4 py-2 transition-colors border border-neutral-700"
    >
      {children}
    </Link>
  );
}

ButtonLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node,
};
