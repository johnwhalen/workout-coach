import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Bricolage_Grotesque, Jost } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-bricolage-grotesque",
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const jost = Jost({
    subsets: ["latin"],
    variable: "--font-jost",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const theme = createTheme({
    fontFamily: "var(--font-jost), sans-serif",
    primaryColor: "cyan",
});

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://workout-coach-lyart.vercel.app"),
    title: "Golden Harbor Workout Coach",
    description: "Personal AI-powered workout coaching with progress tracking and adaptive training recommendations",
    keywords: ["fitness", "workout tracker", "AI coach", "personal training", "strength training", "Golden Harbor"],
    authors: [{ name: "Golden Harbor" }],
    creator: "Golden Harbor",
    applicationName: "Golden Harbor Workout Coach",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    openGraph: {
        title: "Golden Harbor Workout Coach",
        description: "Personal AI-powered workout coaching with progress tracking and adaptive training recommendations",
        url: "https://golden-harbor-workout.vercel.app",
        siteName: "Golden Harbor Workout Coach",
        images: [
            {
                url: "/og.png",
                width: 1200,
                height: 630,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Golden Harbor Workout Coach",
        description: "Personal AI-powered workout coaching with progress tracking and adaptive training recommendations",
        images: ["/og.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${jost.variable} ${bricolageGrotesque.variable} ${geistSans.variable} ${geistMono.variable}`}
        >
            <body className={`antialiased`}>
                <ClerkProvider
                    signInUrl="/login"
                    signUpUrl="/signup"
                    afterSignInUrl="/chat"
                    afterSignUpUrl="/chat"
                    appearance={{
                        baseTheme: [dark],
                        variables: {
                            // colorPrimary: "blue",
                            // colorBackground: "rgba(20, 69, 47, 1)",
                            fontFamily: "Jost, sans-serif",
                            borderRadius: "0.7rem",
                            colorInputBackground: "white",
                            spacingUnit: "0.9rem",
                        },
                        elements: {},
                        layout: {
                            animations: true,
                            logoLinkUrl: "https://telegra.ph/file/7790682e4986dbb174428.png",
                            logoPlacement: "outside",
                        },
                    }}
                >
                    <main className="mx-auto bg-slate-900">
                        {/* <div className="flex items-start justify-center min-h-screen ">
              <div className="px-10 py-10 mt-24 mw-1 rounded-3xl bg-black shadow-3xl "> */}
                        {/* <div className="mt-4"> */}
                        <MantineProvider defaultColorScheme="dark" theme={theme} forceColorScheme="dark">
                            {children}
                        </MantineProvider>
                        {/* </div> */}
                        {/* </div>
            </div> */}
                    </main>
                </ClerkProvider>
            </body>
        </html>
    );
}
