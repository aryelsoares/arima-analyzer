// Header
"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    const version = "v1.1"

    function scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    }

    return (
        <header className="px-[9%] py-8 bg-bg-second text-[1.6rem] mb-24">
            <div className="flex items-center justify-between gap-6">
                {/* Left */}
                <a href="#" className="flex items-center gap-4">
                    <Image
                        title="Icon"
                        alt="icon"
                        src={"icon.svg"}
                        width="30"
                        height="30"
                    />
                    <p className="font-semibold">
                        ARIMA Analyzer · {version}
                    </p>
                </a>

                {/* Right */}
                <button
                    onClick={scrollToBottom}
                    aria-label="Back to bottom"
                    className={`
                        flex items-center justify-center
                        w-12 h-12
                        rounded-full
                        bg-bg-third
                        transition-all duration-300
                        hover:text-main
                        hover:shadow-[0_0_1.5rem_#444546]
                        hover:translate-y-1
                        cursor-pointer
                    `}
                >
                    <FontAwesomeIcon icon={faArrowDown} size="lg" />
                </button>
            </div>
    </header>
    )
}