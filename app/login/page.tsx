"use client";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  IconButton,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { redirect } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";

const LoginPage = () => {
  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
  }>();
  const { user, login } = useAuth();
  const toast = useToast();

  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [invalidCredentialsError, setInvalidCredentialsError] =
    useState<boolean>(false);

  const handleToggleShowPassword = () => setShowPass(!showPass);

  const onSubmit = handleSubmit(async (validFormData) => {
    try {
      setLoading(true);
      setInvalidCredentialsError(false);

      const { email, password } = validFormData;

      const { error } = await login({ email, password });

      if (!error) {
        toast({
          title: "Welcome back!",
          status: "success",
          position: "top",
        });
        return;
      }

      if (error.message === "Email not confirmed") {
        toast({
          title: "Need to confirm email!",
          description: `Please check your email to confirm your account (${email})`,
          status: "error",
          position: "top",
          isClosable: true,
        });
        return;
      }
      // Another type of error, like invalid credentials
      else {
        setInvalidCredentialsError(true);
      }
    } catch (error) {
      toast({
        title: "Sorry!",
        description: "Invalid email or password",
        status: "error",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  });

  // Redirect if user is already logged in
  console.log(user);

  if (user) {
    redirect("/");
  }

  return (
    <Container
      maxW="container.sm"
      py="10"
      display="flex"
      justifyContent="center"
      alignItems="center"
      h="full"
      overflow="hidden"
    >
      <Box w="full">
        <Box
          rounded="xl"
          px="5"
          pt="5"
          flex="1"
          textAlign="center"
          shadow="xl"
          border="1px solid #acacac1c"
        >
          <Box py="5">
            <form onSubmit={onSubmit} autoComplete="off">
              <VStack spacing="4">
                {invalidCredentialsError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Invalid email or password!</AlertTitle>
                    <AlertDescription>Please try again.</AlertDescription>
                  </Alert>
                )}
                <FormControl isInvalid={errors.email ? true : false} isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    type="email"
                    {...register("email", {
                      required: {
                        value: true,
                        message: "Email is required",
                      },
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    size="lg"
                  />
                  {errors.email && (
                    <FormErrorMessage textAlign="left">
                      {errors.email.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl
                  isInvalid={errors.password ? true : false}
                  isRequired
                >
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPass ? "text" : "password"}
                      {...register("password", {
                        required: {
                          value: true,
                          message: "Password is required",
                        },
                      })}
                      size="lg"
                    />
                    <InputRightElement width="5.5rem" mt="4px" mr="4px">
                      <IconButton
                        size="sm"
                        onClick={handleToggleShowPassword}
                        icon={showPass ? <FiEyeOff /> : <FiEye />}
                        aria-label="Show password"
                        title={showPass ? "Hide password" : "Show password"}
                        bg="gray.300"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <FormErrorMessage textAlign="left">
                      {errors.password.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <VStack w="100%">
                  <Button
                    mt={4}
                    type="submit"
                    size="lg"
                    w="100%"
                    colorScheme="blue"
                    isLoading={loading}
                    rightIcon={<Icon as={FiArrowRight} fontSize="xl" />}
                  >
                    Login
                  </Button>
                </VStack>
              </VStack>
            </form>
            {/* Forgot password */}
            <Box mt="5">
              <Button variant="link" size="sm">
                Forgot password?
              </Button>
            </Box>
            {/* Link to sign up */}
            <HStack justify="center" mt="5">
              <Link href="/register">
                <HStack justify="center" _hover={{ textDecor: "underline" }}>
                  <Box>Don't have an account?</Box>
                  <Box color="blue.300">Sign up</Box>
                </HStack>
              </Link>
            </HStack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
