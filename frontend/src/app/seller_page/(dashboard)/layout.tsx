import Dashboard from "./dashboard";

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return(
      <>
        <Dashboard />
        <main className="bg-white"> 
            {children}
        </main>
      </>
    ) 
  }