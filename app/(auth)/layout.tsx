export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030f06] flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}