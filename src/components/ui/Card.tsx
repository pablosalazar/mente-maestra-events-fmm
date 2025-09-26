type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({ children, className, style }: CardProps) {
  return (
    <div className={`card w-full ${className}`} style={style}>
      {children}
    </div>
  );
}
