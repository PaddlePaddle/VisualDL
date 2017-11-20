import core

im = core.im()

im.add_tablet("tag0", 50)

tablet = im.tablet("tag0")
tablet.add_scalar_int32(1, 13)

print "buffer", tablet.buffer()
print "buffer", tablet.human_readable_buffer()
