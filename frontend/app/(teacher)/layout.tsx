import React from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Plus tard : La Sidebar du Professeur viendra ici */}
      <main>
        {children}
      </main>
    </div>
  );
}