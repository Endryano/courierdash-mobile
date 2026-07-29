export type SupabaseEnvironment = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type SupabaseEnvironmentVariables = {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

function requiredValue(value: string | undefined, variableName: string): string {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`Supabase configuration error: ${variableName} is required.`);
  }

  return trimmedValue;
}

export function validateSupabaseEnvironment(
  variables: SupabaseEnvironmentVariables,
): SupabaseEnvironment {
  const supabaseUrl = requiredValue(variables.EXPO_PUBLIC_SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = requiredValue(
    variables.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  );

  try {
    const parsedUrl = new URL(supabaseUrl);

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    throw new Error('Supabase configuration error: EXPO_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabaseEnvironment(): SupabaseEnvironment {
  return validateSupabaseEnvironment({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  });
}
