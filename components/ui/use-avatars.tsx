import Avvvatars from "avvvatars-react";

interface AvvatarsProps {
 value: string,
 type?: "character" | "shape"
}
export default function Avvatars({ value, type = "shape" }: AvvatarsProps) {
 return <Avvvatars style={type} value={value} />;
}