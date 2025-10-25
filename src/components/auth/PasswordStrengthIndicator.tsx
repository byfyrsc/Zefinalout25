import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  text: string;
  fulfilled: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', text: 'Pelo menos 8 caracteres', fulfilled: false },
    { id: 'uppercase', text: 'Pelo menos 1 letra maiúscula', fulfilled: false },
    { id: 'lowercase', text: 'Pelo menos 1 letra minúscula', fulfilled: false },
    { id: 'number', text: 'Pelo menos 1 número', fulfilled: false },
    { id: 'special', text: 'Pelo menos 1 caractere especial', fulfilled: false },
  ]);

  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('bg-red-500');

  useEffect(() => {
    const newRequirements = [...requirements];
    let fulfilledCount = 0;

    // Check length
    const hasLength = password.length >= 8;
    newRequirements[0].fulfilled = hasLength;
    if (hasLength) fulfilledCount++;

    // Check uppercase
    const hasUppercase = /[A-Z]/.test(password);
    newRequirements[1].fulfilled = hasUppercase;
    if (hasUppercase) fulfilledCount++;

    // Check lowercase
    const hasLowercase = /[a-z]/.test(password);
    newRequirements[2].fulfilled = hasLowercase;
    if (hasLowercase) fulfilledCount++;

    // Check number
    const hasNumber = /[0-9]/.test(password);
    newRequirements[3].fulfilled = hasNumber;
    if (hasNumber) fulfilledCount++;

    // Check special character
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    newRequirements[4].fulfilled = hasSpecial;
    if (hasSpecial) fulfilledCount++;

    setRequirements(newRequirements);

    // Calculate strength
    const newStrength = Math.min(100, (fulfilledCount / requirements.length) * 100);
    setStrength(newStrength);

    // Set strength label and color
    if (newStrength === 0) {
      setStrengthLabel('Digite uma senha');
      setStrengthColor('bg-gray-300');
    } else if (newStrength < 40) {
      setStrengthLabel('Fraca');
      setStrengthColor('bg-red-500');
    } else if (newStrength < 80) {
      setStrengthLabel('Média');
      setStrengthColor('bg-yellow-500');
    } else {
      setStrengthLabel('Forte');
      setStrengthColor('bg-green-500');
    }
  }, [password, requirements]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Força da senha</span>
        <span className={`text-sm font-medium ${strength >= 80 ? 'text-green-600' : strength >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
          {strengthLabel}
        </span>
      </div>
      <Progress value={strength} className={`h-2 ${strengthColor}`} />
      
      <div className="space-y-1 mt-2">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center text-sm">
            {req.fulfilled ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span className={req.fulfilled ? 'text-green-600' : 'text-gray-500'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};