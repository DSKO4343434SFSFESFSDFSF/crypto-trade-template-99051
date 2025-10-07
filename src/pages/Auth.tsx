import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, ArrowLeft, CalendarIcon, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  
  // Step 1: Authentication
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Step 2: Personal Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  
  // Step 3: KYC
  const [kycDocType, setKycDocType] = useState("");
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const countries = [
    { code: "us", name: "United States" },
    { code: "gb", name: "United Kingdom" },
    { code: "ca", name: "Canada" },
    { code: "au", name: "Australia" },
    { code: "de", name: "Germany" },
    { code: "fr", name: "France" },
    { code: "es", name: "Spain" },
    { code: "it", name: "Italy" },
    { code: "nl", name: "Netherlands" },
    { code: "se", name: "Sweden" },
    { code: "no", name: "Norway" },
    { code: "dk", name: "Denmark" },
    { code: "fi", name: "Finland" },
    { code: "pl", name: "Poland" },
    { code: "jp", name: "Japan" },
    { code: "cn", name: "China" },
    { code: "in", name: "India" },
    { code: "br", name: "Brazil" },
    { code: "mx", name: "Mexico" },
    { code: "ar", name: "Argentina" },
  ];

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/dashboard");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An error occurred during login.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Signup - move to step 2
      if (passwordStrength < 60) {
        toast({
          title: "Weak Password",
          description: "Please create a stronger password.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
            country: country,
            address: address,
            city: city,
            postal_code: postalCode,
            date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("User creation failed");

      // Upload KYC document
      if (kycFile) {
        const fileExt = kycFile.name.split(".").pop();
        const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(fileName, kycFile);

        if (uploadError) throw uploadError;

        // Update profile with KYC info
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            kyc_document_type: kycDocType,
            kyc_document_url: fileName,
          })
          .eq("id", authData.user.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      setStep(4);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    if (isLogin) return "Welcome back";
    switch (step) {
      case 1: return "Create Account";
      case 2: return "Personal Details";
      case 3: return "Verify Identity";
      case 4: return "All Set!";
      default: return "Get Started";
    }
  };

  const getStepDescription = () => {
    if (isLogin) return "Sign in to your account to continue";
    switch (step) {
      case 1: return "Enter your email and create a secure password";
      case 2: return "Tell us a bit about yourself";
      case 3: return "Upload your identity document";
      case 4: return "Check your email to verify your account";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      
      <Button
        variant="ghost"
        className="absolute top-8 left-8 text-white z-10"
        onClick={() => {
          if (!isLogin && step > 1) {
            setStep(step - 1);
          } else {
            navigate("/");
          }
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Command className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl">Nexbit</span>
          </div>

          {!isLogin && step < 4 && (
            <div className="mb-6 flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    s <= step ? "bg-primary" : "bg-white/10"
                  )}
                />
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-center mb-2">{getStepTitle()}</h1>
          <p className="text-center text-gray-400 mb-8">{getStepDescription()}</p>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep1}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/5 border-white/10"
                  />
                  {!isLogin && password && (
                    <div className="space-y-2">
                      <Progress value={passwordStrength} className="h-2" />
                      <p className={cn(
                        "text-xs",
                        passwordStrength < 40 ? "text-red-400" :
                        passwordStrength < 70 ? "text-yellow-400" :
                        "text-green-400"
                      )}>
                        {passwordStrength < 40 ? "Weak" :
                         passwordStrength < 70 ? "Medium" :
                         "Strong"} password
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="button-gradient w-full"
                  disabled={loading}
                >
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Continue"}
                </Button>
              </motion.form>
            )}

            {step === 2 && !isLogin && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep2}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select your country">
                        {country && (
                          <div className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/w20/${country}.png`} alt="" className="w-5 h-auto" />
                            <span>{countries.find(c => c.code === country)?.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10 z-50">
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <div className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/w20/${c.code}.png`} alt="" className="w-5 h-auto" />
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/5 border-white/10",
                          !dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-background border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit" className="button-gradient w-full">
                  Continue
                </Button>
              </motion.form>
            )}

            {step === 3 && !isLogin && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep3}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={kycDocType} onValueChange={setKycDocType} required>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10 z-50">
                      <SelectItem value="drivers-license">Driver's License</SelectItem>
                      <SelectItem value="id-card">National ID Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kycFile">Upload Document</Label>
                  <div className="relative">
                    <Input
                      id="kycFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                      required
                      className="bg-white/5 border-white/10"
                    />
                    {kycFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        {kycFile.name}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="button-gradient w-full"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Complete Signup"}
                </Button>
              </motion.form>
            )}

            {step === 4 && !isLogin && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                <p className="text-gray-400">
                  We've sent a verification link to {email}. Please check your inbox and verify your account.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="button-gradient w-full"
                >
                  Return to Home
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setStep(1);
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
