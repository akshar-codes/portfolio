import { FaLinkedin, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiLeetcode } from "react-icons/si";
import { IoGlobeOutline, IoMailOutline } from "react-icons/io5";

const iconMap = {
  linkedin: FaLinkedin,
  github: FaGithub,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaXTwitter,
  x: FaXTwitter,
  leetcode: SiLeetcode,
  website: IoGlobeOutline,
  email: IoMailOutline,
};

export function resolveIcon(key) {
  if (!key) return IoGlobeOutline;
  return iconMap[key.toLowerCase()] ?? IoGlobeOutline;
}

export default iconMap;
