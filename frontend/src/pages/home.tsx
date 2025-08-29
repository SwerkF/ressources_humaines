import About from "@/components/hero/about";
import Landing from "@/components/hero/landing";
import Recent from "@/components/hero/recent";
import JoinUs from "@/components/hero/joinus";
import { Fragment } from "react/jsx-runtime";

export default function Home() {
    return (
        <Fragment>
            <Landing />
            <Recent />
            <About />
            <JoinUs />
        </Fragment>
    );
}
