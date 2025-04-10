import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

// Define the form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number' }),
  howHeard: z.enum(['instagram', 'tiktok', 'linkedin', 'x', 'word_of_mouth', 'other']),
});

type FormValues = z.infer<typeof formSchema>;

type WaitlistFormProps = {
  buttonClassName?: string;
  children?: React.ReactNode;
};

const WaitlistForm = ({ buttonClassName, children }: WaitlistFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      phoneNumber: '',
      howHeard: 'word_of_mouth',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Insert data into Supabase waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { 
            name: data.name, 
            email: data.email,
            phone_number: data.phoneNumber,
            how_heard: data.howHeard,
            joined_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      
      // Show success message
      toast({
        title: t('hero.waitlist.success.title'),
        description: t('hero.waitlist.success.description'),
      });

      // Close the dialog
      setOpen(false);
      
      // Reset the form
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('hero.waitlist.error.title'),
        description: t('hero.waitlist.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
          <Button className={buttonClassName}>
            {t('hero.waitlist.button')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('hero.waitlist.title')}</DialogTitle>
          <DialogDescription>
            {t('hero.waitlist.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('hero.waitlist.form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('hero.waitlist.form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('hero.waitlist.form.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('hero.waitlist.form.emailPlaceholder')} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('hero.waitlist.form.phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('hero.waitlist.form.phoneNumberPlaceholder')} type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="howHeard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('hero.waitlist.form.howHeard')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('hero.waitlist.form.howHeardPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="x">X (Twitter)</SelectItem>
                      <SelectItem value="word_of_mouth">Word of Mouth</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('hero.waitlist.form.submitting') : t('hero.waitlist.form.submit')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistForm; 