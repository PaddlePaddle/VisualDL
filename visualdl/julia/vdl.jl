module VisualDL
  using CxxWrap
  @wrapmodule(joinpath("visualdl/julia","libvdljl"))

  function __init__()
    @initcxx
  end
end

using .VisualDL

logger = VisualDL.LogWriter("./tmp", 100)
VisualDL.set_mode(logger, "train")

tablet = VisualDL.add_tablet(logger, "scalars/scalar0")
scalar0 = VisualDL.Scalar{Float32}(tablet)
for step in 1:100
    VisualDL.add_record(scalar0, step, rand(Float32))
end

h_tablet = VisualDL.add_tablet(logger, "histograms/histogram0")
h0 = VisualDL.Histogram{Float64}(h_tablet, 20)
for step in 1:100
    VisualDL.add_record(h0, step, randn(Float64, 100))
end

img_tablet = VisualDL.add_tablet(logger, "images/image0")
num_samples = 10
sample_num = 0
img = VisualDL.Image(img_tablet, num_samples, 1)

for step in 1:1000
    global num_samples, sample_num
    if sample_num % num_samples == 0
        VisualDL.start_sampling(img)
    end

    idx = VisualDL.index_of_sample_taken(img)
    if idx != -1
      VisualDL.set_sample(img, idx, [10, 10, 3], rand(Float32, 10*10*3) * 255)
      sample_num += 1
      if sample_num % num_samples == 0
        VisualDL.finish_sampling(img)
        sample_num = 0
      end
    end
end

VisualDL.save(logger)