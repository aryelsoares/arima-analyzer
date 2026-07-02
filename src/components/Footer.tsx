// Footer
"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    return (
        <footer className="px-[9%] py-8 bg-bg-second text-[1.6rem]">
            <div className="flex items-center justify-between gap-6">
                {/* Left */}
                <p className="opacity-80">
                    Copyright &copy; {currentYear} by Aryel | MIT License.
                </p>

                {/* Right */}
                <button
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    className={`
                        flex items-center justify-center
                        w-12 h-12
                        rounded-full
                        bg-bg-third
                        transition-all duration-300
                        hover:text-main
                        hover:shadow-[0_0_1.5rem_#444546]
                        hover:-translate-y-1
                        cursor-pointer
                    `}
                >
                    <FontAwesomeIcon icon={faArrowUp} size="lg" />
                </button>
            </div>
        </footer>
    );
}